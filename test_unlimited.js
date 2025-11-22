// Quick test to see what's happening
import { getUnlimitedReviews } from './src/services/configService.js';

console.log('Unlimited Reviews:', getUnlimitedReviews());
console.log('Expected maxCards:', getUnlimitedReviews() ? Infinity : 20);
