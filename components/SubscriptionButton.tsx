"use client";
import React from "react";
import { Button } from "./ui/button";
import axios from "axios";

type Props = { isPro: boolean };

const SubscriptionButton = (props: Props) => {
  const [loading, setLoading] = React.useState(false);
  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      className="w-full mr-2 text-black"
      disabled={loading || props.isPro}
      onClick={handleSubscription}
      variant="outline"
    >
      {props.isPro ? "Thank you for subscribing!" : "Get Pro"}
    </Button>
  );
};

export default SubscriptionButton;
