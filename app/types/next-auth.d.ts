// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    bloodType?: string | null;
    medicalConditions?: string | null;
    medications?: string | null;
    weight?: number | null;
    height?: number | null;
    age?: number | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      bloodType?: string | null;
      medicalConditions?: string | null;
      medications?: string | null;
      weight?: number | null;
      height?: number | null;
      age?: number | null;
    };
  }

  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    bloodType?: string | null;
    medicalConditions?: string | null;
    medications?: string | null;
    weight?: number | null;
    height?: number | null;
    age?: number | null;
  }
}