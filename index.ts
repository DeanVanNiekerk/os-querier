import * as puppeteer from "puppeteer-extra";
// @ts-ignore
import * as StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer-extra-plugin/dist/puppeteer";
import * as fs from "fs";
import { OrdersResponse } from "./types/response";

const ignoreRequestsMainnet = [
  "https://opensea.io/cdn-cgi/rum",
  "https://opensea.io/static/images",
  "https://api.opensea.io/tokens/",
];

const ignoreRequestsTestnet = [
  "https://testnets.opensea.io/cdn-cgi/rum",
  "https://testnets.opensea.io/static/images",
  "https://testnets-api.opensea.io/tokens/",
];

const ignoreRequests = [
  "https://lh3.googleusercontent.com",
  "https://api.amplitude.com/",
  "https://testnets.opensea.io/cdn-cgi/rum",
  "https://testnets.opensea.io/static/images",
  "https://fonts.gstatic.com",
  "ingest.sentry.io",
  "https://rum",
  "https://www.google-analytics.com",
  "https://stats.g.doubleclick.ne",
  "https://testnets-api.opensea.io/tokens/",
  "https://www.googletagmanager.com",
  "https://static.cloudflareinsights.com",
  "fullstory.com",
  ".svg",
  ".png",
  ...ignoreRequestsMainnet,
  ...ignoreRequestsTestnet,
];

type Network = "mainnet" | "testnet";

const getSellOrders = (
  network: Network,
  collection: string,
  pageSize: number,
  cursor: string | null
): Promise<OrdersResponse> => {
  const baseWebAppUrl = getBaseWebappUrl(network);
  const baseGraphqlUrl = getBaseGraphqlUrl(network);

  return new Promise(async (resove, reject) => {
    // @ts-ignore
    puppeteer.use(StealthPlugin());

    // @ts-ignore
    const browser = (await puppeteer.launch({
      headless: true,
      userDataDir: "./cache",
      args: ["--no-sandbox"],
    })) as Browser;
    const page = await browser.newPage();

    let requestIntercepted = false;

    await page.setRequestInterception(true);

    console.log("checking for graphql asset query....");

    page.on("request", async (interceptedRequest) => {
      // Abort unrelated requests
      if (
        requestIntercepted ||
        ignoreRequests.some((r) => interceptedRequest.url().indexOf(r) !== -1)
      ) {
        // console.log("aborting", interceptedRequest.url());
        interceptedRequest.abort();
        return;
      }

      console.log("- ", interceptedRequest.url());

      if (
        interceptedRequest.url() === baseGraphqlUrl &&
        interceptedRequest.method() === "POST" &&
        interceptedRequest.postData().indexOf("AssetSearchQuery") != -1
      ) {
        requestIntercepted = true;
        // console.log("----------------------------------------------------");
        // console.log(interceptedRequest.method());
        // console.log(interceptedRequest.headers());
        // console.log(interceptedRequest.postData());

        const data = JSON.parse(interceptedRequest.postData());

        // {
        //   categories: null,
        //   chains: null,
        //   collection: 'crypto-bull-society',
        //   collectionQuery: null,
        //   collectionSortBy: 'SEVEN_DAY_VOLUME',
        //   collections: [ 'crypto-bull-society' ],
        //   count: 50,
        //   cursor: 'YXJyYXljb25uZWN0aW9uOjI0OQ==',
        //   identity: null,
        //   includeHiddenCollections: false,
        //   numericTraits: null,
        //   paymentAssets: null,
        //   priceFilter: null,
        //   query: null,
        //   resultModel: null,
        //   showContextMenu: false,
        //   shouldShowQuantity: false,
        //   sortAscending: true,
        //   sortBy: 'PRICE',
        //   stringTraits: null,
        //   toggles: [ 'BUY_NOW' ],
        //   creator: null,
        //   assetOwner: null,
        //   isPrivate: null,
        //   safelistRequestStatuses: null
        // }

        console.log("-------------------------------------");
        console.log("found graphql asset query");
        console.log("updating query variables");

        data.variables = {
          ...data.variables,
          count: pageSize,
          cursor: cursor,
          collectionSortBy: "SEVEN_DAY_VOLUME",
          sortAscending: true,
          sortBy: "PRICE",
          toggles: ["BUY_NOW"],
        };

        console.log({
          variables: data.variables,
        });

        interceptedRequest.continue({
          postData: JSON.stringify(data),
        });
      } else {
        interceptedRequest.continue();
      }
    });

    page.on("response", async (response) => {
      if (
        response.request().url() === baseGraphqlUrl &&
        response.request().method() === "POST" &&
        response.request().postData().indexOf("AssetSearchQuery") != -1
      ) {
        try {
          const res = await response.json();

          console.log("Response received. Status Code: ", response.status());

          if (res.data?.query) {
            const data: OrdersResponse = res.data;
            // console.log(data);
            resove(data);
          }
        } catch {}
      }
    });

    await page.goto(`${baseWebAppUrl}/assets/${collection}`, {
      waitUntil: "networkidle2",
    });

    page.setViewport({
      width: 1200,
      height: 1800,
    });

    autoScroll(page);

    // await browser.close();
  });
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

const getBaseWebappUrl = (network: Network): string => {
  if (network === "testnet") return "https://testnets.opensea.io";
  return "https://opensea.io";
};

const getBaseGraphqlUrl = (network: Network): string => {
  if (network === "testnet") return "https://testnets-api.opensea.io/graphql/";
  return "https://api.opensea.io/graphql/";
};

const go = async () => {
  // const orders = await getSellOrders(
  //   "testnet",
  //   "cryptokittiesrinkeby",
  //   100,
  //   "YXJyYXljb25uZWN0aW9uOjk="
  // );
  const orders = await getSellOrders(
    "mainnet",
    "crypto-bull-society",
    50,
    "YXJyYXljb25uZWN0aW9uOjI0OQ=="
  );
  console.log("pageInfo", {
    returnedCount: orders.query.search.edges.length,
    totalCount: orders.query.search.totalCount,
    pageInfo: orders.query.search.pageInfo,
  });
  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 4));
  process.exit();
};

go();
