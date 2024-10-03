import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SideMenu from './SideMenu';
import { useNavigate } from 'react-router-dom';

// Mock the navigate function
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('SideMenu Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  const renderComponent = (initialRoute) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <SideMenu />
      </MemoryRouter>
    );
  };

  test('navigates to Homepage when Home is clicked', () => {
    renderComponent('/Homepage');

    fireEvent.click(screen.getByText(/Home/i));
    expect(mockNavigate).toHaveBeenCalledWith('/Homepage');
  });

  test('navigates to Bus Schedule when Bus Schedule is clicked', () => {
    renderComponent('/Homepage');

    fireEvent.click(screen.getByText(/Bus Schedule/i));
    expect(mockNavigate).toHaveBeenCalledWith('/BusSchedule');
  });

  test('navigates to Rentals when Rentals is clicked', () => {
    renderComponent('/Homepage');

    fireEvent.click(screen.getByText(/Rentals/i));
    expect(mockNavigate).toHaveBeenCalledWith('/Rentals');
  });

  test('navigates to Profile when Profile is clicked', () => {
    renderComponent('/Homepage');

    fireEvent.click(screen.getByText(/Profile/i));
    expect(mockNavigate).toHaveBeenCalledWith('/Profile');
  });

  test('navigates to Logout when Logout is clicked', () => {
    renderComponent('/Homepage');

    fireEvent.click(screen.getByText(/Logout/i));
    expect(mockNavigate).toHaveBeenCalledWith('/Logout');
  });
  // Tests for verifying the active class

  test('adds active class for Bus Schedule when pathname is /BusSchedule', () => {
    renderComponent('/BusSchedule');
    const busScheduleItem = screen.getByText(/Bus Schedule/i).closest('.menu-item');
    expect(busScheduleItem).toHaveClass('active');
  });

  test('does not add active class for Bus Schedule when pathname is not /BusSchedule', () => {
    renderComponent('/OtherPath');
    const busScheduleItem = screen.getByText(/Bus Schedule/i).closest('.menu-item');
    expect(busScheduleItem).not.toHaveClass('active');
  });

  test('adds active class for Rentals when pathname is /Rentals', () => {
    renderComponent('/Rentals');
    const rentalsItem = screen.getByText(/Rentals/i).closest('.menu-item');
    expect(rentalsItem).toHaveClass('active');
  });

  test('does not add active class for Rentals when pathname is not /Rentals', () => {
    renderComponent('/OtherPath');
    const rentalsItem = screen.getByText(/Rentals/i).closest('.menu-item');
    expect(rentalsItem).not.toHaveClass('active');
  });

  test('adds active class for Profile when pathname is /Profile', () => {
    renderComponent('/Profile');
    const profileItem = screen.getByText(/Profile/i).closest('.menu-item');
    expect(profileItem).toHaveClass('active');
  });

  test('does not add active class for Profile when pathname is not /Profile', () => {
    renderComponent('/OtherPath');
    const profileItem = screen.getByText(/Profile/i).closest('.menu-item');
    expect(profileItem).not.toHaveClass('active');
  });

  test('adds active class for Logout when pathname is /Logout', () => {
    renderComponent('/Logout');
    const logoutItem = screen.getByText(/Logout/i).closest('.menu-item');
    expect(logoutItem).toHaveClass('active');
  });

  test('does not add active class for Logout when pathname is not /Logout', () => {
    renderComponent('/OtherPath');
    const logoutItem = screen.getByText(/Logout/i).closest('.menu-item');
    expect(logoutItem).not.toHaveClass('active');
  });

});

