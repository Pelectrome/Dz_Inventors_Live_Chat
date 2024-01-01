import React from 'react';
import ReactDOM from 'react-dom';
import ChatComponent from "./routes/ChatComponent";
import ClearChatComponent from './routes/ClearChatComponent';
import ErrorPage from "./routes/ErrorPage";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import '../public/styles.css';

const router = createBrowserRouter([
    {
        path: "/",
        element: <ChatComponent />,
        errorElement: <ErrorPage />,

    },
    {
        path: "/clear_chat",
        element: <ClearChatComponent />,
    },
    {
        path: "/*",
        element: <ErrorPage />,
    },
]);

ReactDOM.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
    document.getElementById('root') // Adjust the target element ID if necessary
);
