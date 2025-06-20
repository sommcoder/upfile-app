# Why here?

We can't use .ts inside extensions. Shopify CLI won't allow this. So we need to write typescript outside of the /extensions directory

#### Ideally, I would love to be able to move to a more modular file system, Vite could bundle these files, strip out the TS and add the bundle to the theme-extensions folder.
