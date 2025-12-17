import stripePackage from 'stripe';
import config from '../../config';
export const stripe = new stripePackage.Stripe(config.stripe_secret_key as string);
