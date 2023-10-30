// Import the Ratelimit and Redis classes from the @upstash/ratelimit and @upstash/redis packages
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define an async function called ratelimit that takes a string identifier as input
export async function rateLimit(identifier: string) {
	// Create a new instance of the Ratelimit class with the Redis instance created from the environment variables
	// Set the limiter to a sliding window that allows 10 requests in a 10 second period
	// Enable analytics tracking and set a prefix for the Redis keys used by the instance
	const rateLimit = new Ratelimit({
		redis: Redis.fromEnv(),
		limiter: Ratelimit.slidingWindow(10, "10 s"),
		analytics: true,
		prefix: "@upstash/ratelimit",
	});

	// Call the limit method of the Ratelimit instance with the identifier as input
	// Wait for the method to complete and return the result
	return await rateLimit.limit(identifier);
}
