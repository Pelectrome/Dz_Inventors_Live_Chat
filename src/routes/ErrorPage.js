import React, { useState } from 'react';
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div id="error-page" style={styles.container}>
            <h1 style={styles.title}>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Adjust as needed
    },
    title: {
        fontSize: '4rem', // Adjust the font size as needed
        marginBottom: '20px',
    },
};
