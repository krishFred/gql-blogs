import { GraphQLError } from "graphql";
import { User } from "../data";
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { User as UserType } from "../generated/graphql";

const user = new User();

export const getUser = async (
  req: Request,
  res: Response
): Promise<Partial<UserType> | JwtPayload | null> => {
  try {
    console.log("is hitting on utils");

    const payload = user.verifyToken(req.cookies.access_token);

    if (!payload) {
      // This const payload is scope of within the if clause so don't be confused with that
      const payload = await user.refreshSession(req.cookies.refresh_token, res);
      return payload;
    }

    return payload as JwtPayload;
  } catch (error) {
    console.log({error: error, screwup: " in Authpage"})
    throw new GraphQLError(error instanceof Error ? error.message : "Internal Server Error", {
      extensions: {
        code: error instanceof Error ? "UNAUTHENTICATED" : "INTERNAL_SERVER_ERROR",
      },
    });
  }
};


export const ensureAuthenticated = (auth: boolean): void => {
  if (!auth) {
    throw new GraphQLError("Unauthenticated. Please log in.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
};

