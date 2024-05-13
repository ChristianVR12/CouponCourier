import {
  Box,
  ContextView,
  List,
  ListItem,
  Button,
  FocusView,
  Select,
  Link,
  Icon
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

const getCouponDisplayName = (coupon: Stripe.Coupon) => {
  return `${coupon.name} (Amoun Off: ${coupon.amount_off})`;
};

const ListCoupons = ({ userContext, environment }: ExtensionContextValue) => {
  const [openFocus, setOpenFocus] = useState<boolean>(false);
  const [coupons, setCoupons] = useState<Stripe.Coupon[]>();
  const [selectedCoupon, setSelectedCoupon] =  useState<Stripe.Coupon>();

  const BASE_URL =
    environment.mode == "test"
      ? `https://dashboard.stripe.com/${environment.mode}`
      : `https://dashboard.stripe.com`;

  const getCoupons = useCallback(async () => {
    const data = await stripeClient.coupons.list();
    setCoupons(data.data);
  }, []);

  const getCouponData = useCallback(async (couponId: string) => {
    const data = await stripeClient.coupons.retrieve(couponId);
    setSelectedCoupon(data);
  }, []);

  useEffect(() => {
    getCoupons();
  }, [getCoupons]);
  
  const resetState = () => {
    setOpenFocus(false);
    setSelectedCoupon(undefined);
  };

  return (
    <ContextView title="Welcome">
      <Box css={{ marginBottom: "medium" }}>
        Design, Colors, and a message about CouponCourier 
      </Box>

      <Button type="primary" onPress={() => setOpenFocus(true)}>
        Manage Coupons
      </Button>

      <FocusView
        title="Manage Coupons"
        shown={openFocus}
        setShown={() => setOpenFocus(false)}
        primaryAction={
          <Button type="primary" onPress={resetState}>
            Save
          </Button>
        }
        secondaryAction={
          <Button onPress={() => resetState()}>Cancel</Button>
        }
      >
        <>
        <Select
        css={{width: 'fill'}}
        name="coupon-selecter"
        onChange={(e) => {
          getCouponData(e.target.value);
        }}
        >
          <option value=""></option>
          {coupons &&
            coupons.map((coupon) => (
              <option key={coupon.id} value={coupon.id}>
                {getCouponDisplayName(coupon)}
              </option>
            ))}
        </Select>

        {selectedCoupon && (
          <List onAction={(id) => console.log(id)} aria-label="">
            <Box css={{ 
              marginTop: "medium",
              width: "fill",
              padding: "medium",
            }}>
            <ListItem
              value={
                <Button href={`${BASE_URL}/coupons/${selectedCoupon.id}`} type="primary" onPress={() => resetState()}>
                  <Box css={{marginRight: 'xsmall'}}>
                    <Icon name="coupon" />
                  </Box>
                  Edit
                </Button>
              }
              // value={selectedCoupon.name}
              id={selectedCoupon.id}
              title="Name"
              secondaryTitle={selectedCoupon.name}
            />
            </Box>
          </List>
        )}
        </>

      </FocusView>
    </ContextView>
  );
};

export default ListCoupons;
