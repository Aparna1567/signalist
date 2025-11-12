// import { betterAuth } from "better-auth";
// import { mongodbAdapter} from "better-auth/adapters/mongodb";
// import { connectToDatabase} from "@/database/mongoose";
// import { nextCookies} from "better-auth/next-js";

// let authInstance: ReturnType<typeof betterAuth> | null = null;

// export const getAuth = async () => {
//     if(authInstance) return authInstance;

//     const mongoose = await connectToDatabase();
//     const db = mongoose.connection.db;

//     if(!db) throw new Error('MongoDB connection not found');

//     authInstance = betterAuth({
//         database: mongodbAdapter(db as any),
//         secret: process.env.BETTER_AUTH_SECRET,
//         baseURL: process.env.BETTER_AUTH_URL,
//         socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     },
//   },

//         emailAndPassword: {
//             enabled: true,
//             disableSignUp: false,
//             requireEmailVerification: false,
//             minPasswordLength: 8,
//             maxPasswordLength: 128,
//             autoSignIn: true,
//         },
//         plugins: [nextCookies()],
//     });

//     return authInstance;
// }

// export const auth = await getAuth();

// import { betterAuth } from "better-auth";
// import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { connectToDatabase } from "@/database/mongoose";
// import { nextCookies } from "better-auth/next-js";

// let authInstance: ReturnType<typeof betterAuth> | null = null;

// export const getAuth = async () => {
//   if (authInstance) return authInstance;

//   const mongoose = await connectToDatabase();
//   const db = mongoose.connection.db;

//   if (!db) throw new Error("MongoDB connection not found");

//   authInstance = betterAuth({
//     database: mongodbAdapter(db as any),
//     secret: process.env.BETTER_AUTH_SECRET,
//     baseURL: process.env.BETTER_AUTH_URL,
//     socialProviders: {
//       google: {
//         clientId: process.env.GOOGLE_CLIENT_ID!,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       },
//     },
//     emailAndPassword: {
//       enabled: true,
//       disableSignUp: false,
//       requireEmailVerification: false,
//       minPasswordLength: 8,
//       maxPasswordLength: 128,
//       autoSignIn: true,
//     },
//     plugins: [nextCookies()],
//   });

//   return authInstance;
// };

// export const auth = await getAuth();


import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/database/mongoose";
import { nextCookies } from "better-auth/next-js";

let authInstance: any;

export const getAuth = async () => {
  if (authInstance) return authInstance;

  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not found");

  authInstance = betterAuth({
    database: mongodbAdapter(db as any),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    user: {
      fields: {
        image: { type: "string", required: false } as any,
      },
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        async profile(profile: Record<string, any>) {
          console.log("📸 Google Profile:", profile);
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image:
              profile.picture ||
              profile.avatar ||
              profile.pictureUrl ||
              profile._json?.picture ||
              profile.photos?.[0]?.value ||
              "",
          };
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
    },

    // ✅ Add event here instead of hooks
    events: {
      async afterSignIn({ user, profile }: { user: any; profile: any }) {
        try {
          const imageUrl =
            profile?.picture ||
            profile?.avatar ||
            profile?.pictureUrl ||
            profile?._json?.picture ||
            profile?.photos?.[0]?.value ||
            "";

          if (imageUrl && !user.image) {
            const users = db.collection("users");
            await users.updateOne({ id: user.id }, { $set: { image: imageUrl } });
            console.log("✅ Added Google image for:", user.email);
          } else {
            console.log("ℹ️ No new image to update for:", user.email);
          }
        } catch (err) {
          console.error("❌ Error saving image:", err);
        }
      },
    },

    plugins: [nextCookies()],
  }) as any;

  return authInstance;
};

export const auth = await getAuth();






