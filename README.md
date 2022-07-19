# Clock In/Out App

An application for clocking in and out of any task.

My buddy recently asked me if I could create a simple clock in & clock out app for his new job! I said, "yea, I can!" and then I did it. This project was a breath of fresh air for me for a couple reasons:

1. **I used Auth0 for the first time**. Wow, it is _so_ much easier to use auth0 than google's oauth2 api or rolling your own jwt based solution.

2. **The app was simple, so I finished the MVP quickly**. This means a lot. I have a tendency to burn myself out on personal projects, but Clock in/out was bite sized, unlike my Computer Assisted RPG app, which quickly became a form nightmare (side thought: I probably need to use a package for that).

3. **I made an app that was clearly useful to people**. I think because of my history as both a board game designer and a barista, I crave creative process that results in concrete and functional experiences. A clock in/out app is going to be used by people, because there's a demand for it! That feels good.

## Tech Stack

- [Auth0](https://auth0.com/) - User Authorization
- [MongoDB Atlas](https://www.mongodb.com/) - Database
- [NextJS](https://nextjs.org/) - Frontend and Backend development (Uses [React.js](https://reactjs.org/))
- [Vercel](https://vercel.com/) - Deployment
- [TailwindCSS](https://tailwindcss.com/) - Frontend Styling

This is the tech stack I've used for all my projects recently (Auth0 is new, but I will likely start using it since it is so easy).

## What I Struggled With

I struggled very little on this project compared to many others I've done recently, thanks largely to Auth0 and the app being so simple. One particular hang up I ran into was prettifying the times and creating the stopwatch. This amounted to me just having to do some careful unit analysis and thinking of edge cases. But My experience with React got me through without much pain.

I also have a tendency to forget to add keys to my map function renders. It's a small struggle of habit, but something I definitly need to work on.
