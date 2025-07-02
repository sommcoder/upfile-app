# PURPOSE

This is for sequencing multiple GraphQL calls into specific actions. Normally each next call relies on the successful execution of the previous call.

However, in a true transaction, you should be able to roll back if even ONE call fails.
