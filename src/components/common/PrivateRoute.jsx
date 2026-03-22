import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ roles }) => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'seller') return <Navigate to="/seller" replace />;
        if (user.role === 'delivery') return <Navigate to="/delivery" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
