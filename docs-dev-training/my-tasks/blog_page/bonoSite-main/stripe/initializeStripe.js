import { loadStripe } from "@stripe/stripe-js";

let stripePromise = null;

const initializeStripe = async () => {
    if(!stripePromise){
        stripePromise = await loadStripe(
            "pk_test_51HDQT3KUVUnt8GtyTgw5k0MXEJYXLylCz0bVftNnRCc1TL6oRZFXE2Wq5gr2WGiem1cUE8eCkZALl12EEA5olb1000NZZGIIlz"
        )
    }
    return stripePromise;
}

export default initializeStripe;