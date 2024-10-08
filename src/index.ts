import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { ExpressContextFunctionArgument, expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { PrismaConnect } from './prisma.client';
import path from 'path';
import { readFileSync } from 'fs';
import { resolvers} from './resolvers';
import { User, Blog, Comment} from './data'
import { MyContext } from './utils/context';
import cookieParser from 'cookie-parser'
import { getUser } from './utils/auth';
import { JwtPayload } from 'jsonwebtoken';




// Load environment variables
(async () => (await import('dotenv')).config())();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  credentials: true
}));
app.use(cookieParser())

// Testing route
app.get('/api', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'API is hitting well',
  });
});

// GraphQL setup
const typeDefs = `#graphql ${readFileSync(
  path.resolve(__dirname, './schema/schema.graphql'),
  { encoding: 'utf-8' }
)}`;

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,

  introspection: process.env.NODE_ENV !== 'production',
  
});

async function startServer() {
  try {
    // Start Apollo Server
    await server.start();

    // Apply GraphQL middleware after server has started
    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req, res }: ExpressContextFunctionArgument): Promise<MyContext> => {
          const token = req?.cookies?.token;
          console.log(token)
          let user : null | string| JwtPayload = null;
          if(token) user = await getUser(token);
          let auth = false;
          if(user) auth = true
          
          return {
            dataSources: {
              User: new User(),
              Blog: new Blog(),
              Comment: new Comment(),
            },
            req,
            res,
            auth
          };
        }
      })
    );
    

    // Connect to the database
    PrismaConnect();

    // Start the Express server
    app.listen(port, () => {
      console.log('Server is running 😊');
      console.log(`http://localhost:${port}/graphql`);
    });
  } catch (error) {
    console.log('------------------------- APP CRASHED -----------------------------');
    console.error(error);
  }
}

// Start the server
startServer();
