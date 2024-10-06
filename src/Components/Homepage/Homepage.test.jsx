import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Homepage from './Homepage'; // Adjust the import path as needed

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Homepage Component', () => {
  it('navigates to home page on clicking "Sign out"', () => {
    render(
      <Router>
        <Homepage />
      </Router>
    );

    // Click the "Sign out" button
    fireEvent.click(screen.getByText('Sign out'));

    // Check if navigate was called with "/"
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

