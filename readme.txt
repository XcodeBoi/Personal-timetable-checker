
development notes:

this started as a server side rendered page, and then was migrated over to a websocket style page. This was due to the ability to switch dates - its faster to send the data over a socket and handle rendering client side than send an api request, process the request, server side render it, send it, and then render it again. This simplifed the code (socket.io makes the job piss easy) and made the user experince better, as there is now no latency in waiting for the DOM to load on a blank screen.

Server side data fetching from compass exists to protect my sessionID, as if it was fetched directly from compass it would bypass the need for a server but would make my ID publicly visable, along with my school website and other data.

Heres some extracted comments: 

https://docs.microsoft.com/en-us/dotnet/api/system.web.sessionstate.httpsessionstate.sessionid?view=netframework-4.8
it appears they use satic asp net session IDs 
I cannot tell the life of the session ID
and will likely need to work out a method of fetching new ones
https://stackoverflow.com/questions/951137/understanding-asp-net-session-life-time
I have no clue how to go about testing session ID lifetime
supposedly if they use the asp net ecosystem they should be using blazor on client side?
that apears to focus on GUI elements and looks a lot newer than compass code
It is likely that sessionID is refreshed once every 24 hours and is generated through
the standard auth method rather than some kind of background script auto polling the server
after a set period of time
ok i got it by checking cookie life time length. Session IDs last for 96 hours.
This means I'll have to write some kind of session ID fetcher