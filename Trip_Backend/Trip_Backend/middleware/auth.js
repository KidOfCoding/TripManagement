import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import "dotenv/config";

// Standard Clerk Middleware
export const requireAuth = ClerkExpressRequireAuth({
    // This will attach auth info to req.auth
});

// Wrapper Middleware
export const authMiddleware = (req, res, next) => {
    // Standard Clerk Auth
    requireAuth(req, res, (err) => {
        if (err) {
            return res.status(401).json({ message: "Unauthenticated" });
        }
        // Clerk attaches userId to req.auth.userId
        next();
    });
};
