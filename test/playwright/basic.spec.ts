// Import necessary Synpress modules and setup
import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";
import basicSetup from "../wallet-setup/basic.setup";

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Extract expect function from test
const { expect } = test;

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TSender/);
});

test("should show airdrop form when connected, otherwise not", async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  // 2. connect to metamask - setup metamask
  const metamask = new MetaMask(
    context,
    metamaskPage,
    basicSetup.walletPassword,
    extensionId
  );
    // Add network to connect to
  const customNetwork = {
    name: "Anvil",
    rpcUrl: "http://localhost:8545",
    chainId: 31337,
    symbol: "ETH",
  }
  await metamask.addNetwork(customNetwork);

  // 1. check we see "Please connect your wallet"
  await page.goto("/");
  await expect(page.getByText("Please connect your wallet")).toBeVisible();

  // Actually connect to metamask
  await page.getByTestId("rk-connect-button").click();
  await page.getByTestId("rk-wallet-option-io.metamask").waitFor({
    state: "visible",
    timeout: 600000, // 120 seconds
  });
  await page.getByTestId("rk-wallet-option-io.metamask").click();
  await metamask.connectToDapp();

  await expect(page.getByText("Token Address")).toBeVisible();
});
