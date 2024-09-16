import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  makeVar,
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { relayStylePagination } from "@apollo/client/utilities"

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HYGRAPH_URL,
})

const authLink = setContext((_, { headers }) => {
  const token = process.env.NEXT_PUBLIC_HYGRAPH_AUTH_TOKEN
  console.log(token);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          worksConnection: relayStylePagination(),
          guestBooksConnection: relayStylePagination(),
          blogs: {
            read(existing, { args: { skip, first } }: any) {
              return existing && existing.slice(skip, skip + first)
            },
            keyArgs: false,
            merge(existing, incoming, { args: { skip } }: any) {
              const merged = existing ? existing.slice(0) : []
              for (let i = 0; i < incoming.length; ++i) {
                merged[skip + i] = incoming[i]
              }
              return merged
            },
          },
        },
      },
    },
  }),
})

export const currentWorkTab = makeVar<string>("All")
export const currentMenu = makeVar<number>(1)
export const currentWork = makeVar<null | string>(null)
export const showMenu = makeVar<boolean>(false)

export default client
