This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Make sure you have node v18 and pnpm. You can install the right version using nvm.

Install all the deps:

```bash
make install
```

Fill out the .env file with the right values; you can use the example as a form.

Run the local server:

```bash
make run
```

## Technologies

1. Next.js (app router)
2. React (UI rendering)
3. trpc for typesafe API calls
4. shadcn/ui (for WYSIWYG components)
5. vercel ai sdk (for streaming and llm invocation)
6. vercel for hosting