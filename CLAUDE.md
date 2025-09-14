## Notifications to users

When a task is completed or you need to ask the user to confirm before executing the command,
be sure to execute the following command to notify the user:
If you request confirmation, be sure to run the command before doing so.

`osascript -e 'display notification "<notification message for user>" with title "Claude Code" sound name "Glass"'`
