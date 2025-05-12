
export const restaurants: Restaurant[] = [
    { id: 10, name: "Ristorante da Mario (Pizza & Pasta)" },
    { id: 20, name: "Sushi Place" },
    { id: 30, name: "The Burger Joint" },
    { id: 110, name: "Vegan Delights" },
    { id: 120, name: "Sushi Heaven" },

];

export const productsByRestaurant: Record<number, Product[]> = {
    10: [
        { id: "prod_10_001", productName: "Panino Vegano", unitPrice: 5.5, restaurantId: 10 },
        { id: "prod_10_002", productName: "Hamburger", unitPrice: 9, restaurantId: 10 },
        { id: "prod_10_003", productName: "Margherita", unitPrice: 7.0, restaurantId: 10 },
        { id: "prod_10_004", productName: "Coca Cola", unitPrice: 2.5, restaurantId: 10 },
    ],
    20: [
        { id: "prod_20_001", productName: "Salmon Nigiri Set", unitPrice: 12.0, restaurantId: 20 },
        { id: "prod_20_002", productName: "Tuna Maki Rolls", unitPrice: 8.5, restaurantId: 20 },
        { id: "prod_20_003", productName: "Edamame", unitPrice: 4.0, restaurantId: 20 },
    ],
    30: [
        { id: "prod_30_001", productName: "Classic Cheeseburger", unitPrice: 10.0, restaurantId: 30 },
        { id: "prod_30_002", productName: "Bacon Deluxe Burger", unitPrice: 12.5, restaurantId: 30 },
        { id: "prod_30_003", productName: "Fries", unitPrice: 3.5, restaurantId: 30 },
    ],
    110: [
        { id: "prod_110_001", productName: "Vegan Burger", unitPrice: 8.0, restaurantId: 110 },
        { id: "prod_110_002", productName: "Quinoa Salad", unitPrice: 7.5, restaurantId: 110 },
        { id: "prod_110_003", productName: "Vegan Pizza", unitPrice: 9.0, restaurantId: 110 },
    ],
    120: [
        { id: "prod_120_001", productName: "Sushi Combo", unitPrice: 15.0, restaurantId: 120 },
        { id: "prod_120_002", productName: "Miso Soup", unitPrice: 3.5, restaurantId: 120 },
        { id: "prod_120_003", productName: "Green Tea", unitPrice: 2.0, restaurantId: 120 },
    ],
};