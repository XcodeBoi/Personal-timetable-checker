
development notes:

this started as a server side rendered page, and then was migrated over to a websocket style page. This was due to the ability to switch dates - its faster to send the data over a socket and handle rendering client side than send an api request, process the request, server side render it, send it, and then render it again. This simplified the code (socket.io makes the job piss easy) and made the user experience better, as there is now no latency in waiting for the DOM to load on a blank screen.

Server side data fetching from compass exists to protect my sessionID, as if it was fetched directly from compass it would bypass the need for a server but would make my ID publicly visable, along with my school website and other data.

The maintainability of server side and client side rendering combined, vs a singular and consistent system is..... problematic. I am at the stage where css rendering needs to be applied logically and doing that on server side templates is not fun. I don't want to move away from a combined system because im optimising for speed of data accessibility in combination with beauty. Removing server side rendering would inhibit instantaneous data display as socket io sometimes takes several seconds to initiate a connection. The front end layout desgin has to account for both systems and its getting very difficult. 
I think I will tinker with setting the colours of grid gutters to act as borders.


It is 3:30am, and I have done the very thing I swore to destroy. I have abandoned any notation of maintainability for the sake of convenience, I have become as terrible as the full stack dev at compass. I have used part of a string as an identifier for type. This atrocity is of a similar class to embedding html4 tags into data strings. If somebody must do what I have done to compass to I, they will have almost as hard a time. The cleanliness has been obliterated; an era of low maintainability has been entered. Though today is the final day, so I think it is okay.

implementing features after the control flow of the program has already been determined of a whim is difficult. At the moment I am trying to fix CRT registration in the front end view, and its proving difficult because of both the way the object is constructed and the flow of the teacher checking function. Its convoluted and some instance dependent variables reside in the global scope, an inherently terrible thing to do and particularly so in a real time webpage that serves more than one client at a time. Fixing this would involve redesigning the control flow of most of the program, and I don't want to do that. In future I will likely predetermine the control flow on a diagram before implementing an improvised one on a whim. Working with instance-based data sets in real time requires you to be a little more careful with scope and the complexity of the data processing code is outrageous

"Why is the CRT handling such a mess??"
Dealing with both pre defined scope and control flow while implementing a new feature was... complicated. Considering this project will be hosted on heroku and only used by me, I am not bothered with efficiency and multi user reliability. its also my school timetable, not going to kill anybody if it messes up. It also won't charge me through the nose for it because its heroku. You have a predefined amount of bandwidth and whatever else to your instance, so its pay $10 and be throttled.

The final steps of this project caused maintainability, future feature implementation and scalability highly problematic. It is unfortunate, but I am lazy and have three other websites I must finish in the next week or so.

On reflection, this code looks like my head wasnt functioning. I should stop writing code at at 2 in the morning.

Heres some extracted comments: 

https://docs.microsoft.com/en-us/dotnet/api/system.web.sessionstate.httpsessionstate.sessionid?view=netframework-4.8
it appears they use satic asp net session IDs 
I cannot tell the life of the session ID
and will likely need to work out a method of fetching new ones
https://stackoverflow.com/questions/951137/understanding-asp-net-session-life-time
I have no clue how to go about testing session ID lifetime
supposedly if they use the asp net ecosystem they should be using blazor on client side?
that appears to focus on GUI elements and looks a lot newer than compass code
It is likely that sessionID is refreshed once every 24 hours and is generated through
the standard auth method rather than some kind of background script auto polling the server
after a set period of time
ok i got it by checking cookie life time length. Session IDs last for 96 hours.
This means I'll have to write some kind of session ID fetcher