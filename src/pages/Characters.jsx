import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function Characters() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to Home page
    navigate(createPageUrl('Home'));
  }, [navigate]);
  
  return null;
}