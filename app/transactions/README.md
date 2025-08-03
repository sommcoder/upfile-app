## PURPOSE

Transactions here are for sequences of multiple GraphQL calls into specific actions. Normally each next call relies on the successful execution of the previous call.

However, in a true transaction, you should be able to roll back if even ONE call fails. So ideally each transaction will also have a rollback utility attached to it in case of Errors thrown during the transaction!

## How to group/name transactions:

This will be based on what they do. So installation and onboarding are good.
