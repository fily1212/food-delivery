import React from 'react';
import { RestaurantSelector } from "@/components/RestaurantSelector";
import { restaurants } from "@/lib/data";

const Page = async () => {

    return (
        <RestaurantSelector restaurants={restaurants} />
    );
};

export default Page;
