<h1 align="center">
  <a href="https://github.com/hiriski/coursespace-landing-page">
  Coursespace - React Online Course Landing Page
  </a>
  <br />
</h1>

![screenshot](public/images/image_processing20220419-31825-1yzr3x9.png)

**Coursespace** is a free landing page template built on top of Material UI and fully coded in **React**.
Simple & light is designed to provide all the basic components using the `sx` prop for a developer need to create landing page for Online Course product.

## Live Demo

Take a look the live demo here 👉 [https://coursespace.vercel.app/](https://coursespace.vercel.app/)

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Admin API Operations

The application includes admin API endpoints for user management. These operations require the `ADMIN_PASSWORD` environment variable to be set in a `.env.local` file and only work in development mode. Below are examples of using these APIs with cURL.

```bash
# Add this to your .env.local file
ADMIN_PASSWORD=your-secure-admin-password
```

### Delete a User

Use the following cURL command to delete a user:

```bash
curl -X POST http://localhost:3000/api/admin/delete-user \
  -H "Content-Type: application/json" \
  -d '{
    "adminPassword": "your-admin-password-from-env",
    "userId": "USER_ID_TO_DELETE"
  }'
```

Replace `USER_ID_TO_DELETE` with the actual Supabase user ID you want to delete.

### Create a User

To create a pre-verified user:

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "adminPassword": "your-admin-password-from-env",
    "userData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "mobile": "1234567890",
      "password": "password123",
      "confirmPassword": "password123",
      "schoolName": "Example School",
      "city": "Example City",
      "currentClass": "11",
      "board": "CBSE"
    }
  }'
```

All user data is stored in the Supabase Auth user_metadata field, making it accessible directly from the auth user object without requiring additional database queries.

These API endpoints are protected by a simple admin password. In a production environment, you should implement proper authentication and authorization.

## Credits

- [Unsplash](https://unsplash.com/)
- [Icons8](https://icons8.com/)
- [MUI](https://mui.com/)
- [React Slick](https://github.com/akiran/react-slick)

<h6>
  <br />
  <p>
   <a href="https://dribbble.com/naiflaramadhan"><img src="https://cdn.dribbble.com/users/5147050/avatars/normal/cd7b217b7d0cde417ef7d64ac123363d.png" alt="Alfian Ramadhan" width="52" height="52"></a>
  </p>
  <p>
  Designed by
  <p> 
  <a href="https://dribbble.com/naiflaramadhan">Alfian Ramadhan</a>
</h6>
