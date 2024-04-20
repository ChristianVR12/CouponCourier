import {
  Box,
  ContextView,
  Link,
  List,
  ListItem,
  Button,
  TextField,
  Inline,
  FocusView
} from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import {createHttpClient, STRIPE_API_KEY} from '@stripe/ui-extension-sdk/http_client';
import Stripe from 'stripe';
import { useCallback, useEffect, useState } from "react";

// Initiate communication with the stripe client.
const stripeClient = new Stripe(STRIPE_API_KEY, {
  httpClient: createHttpClient(),
  apiVersion: '2023-10-16',
})

const ListCoupons = ({ userContext, environment }: ExtensionContextValue) => {
  const [openFocus, setOpenFocus] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [coupons, setCoupons] = useState<Stripe.Coupon[]>();
  const BASE_URL =
    environment.mode == "test"
      ? `https://dashboard.stripe.com/${environment.mode}`
      : `https://dashboard.stripe.com`;

  const getCoupons = useCallback(async () => {
    const data = await stripeClient.coupons.list();
    setCoupons(data.data);
  }, []);

  useEffect(() => {
    getCoupons();
  }, [getCoupons]);

  // For this example, we save the result in memory.
  // You may wish to store this data on your backend in a real life scenario.
  const handleSave = () => {
    setName(text);
    setOpenFocus(false);
  };
  return (
    <ContextView title="Email Coupons to Customers">
      <Box css={{ marginBottom: "medium" }}>
        The FocusView provides a dedicated space to display info or complete
        tasks. Click the button below to open the FocusView.
      </Box>

      <Button type="primary" onPress={() => setOpenFocus(true)}>
        Open
      </Button>

      <Box css={{ marginTop: "medium" }}>
        {name ? (
          <Inline css={{ font: "bodyEmphasized" }}>Name: {name}</Inline>
        ) : (
          null
        )}
      </Box>

      <FocusView
        title="Focus View"
        shown={openFocus}
        onClose={() => setOpenFocus(false)}
        primaryAction={
          <Button type="primary" onPress={handleSave}>
            Save
          </Button>
        }
        secondaryAction={
          <Button onPress={() => setOpenFocus(false)}>Cancel</Button>
        }
      >
        <TextField
          label="Add a name"
          onChange={(e) => setText(e.target.value)}
        />
      </FocusView>
    </ContextView>
  );
};

export default ListCoupons;
