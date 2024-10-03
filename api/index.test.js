const request = require('supertest');
const app = require('./index');

describe('Express API', () => {
  
  // Test for root endpoint
  it('GET / should return live status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Express campus-transportation live');
  });

  // Test for getting schedule
  it('GET /getSchedule should return transportation schedule', async () => {
    const res = await request(app).get('/getSchedule');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test for getting rent data
  it('GET /getRent should return rental station inventory', async () => {
    const res = await request(app).get('/getRent');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test for getting locations
  it('GET /getLocations should return locations data', async () => {
    const res = await request(app).get('/getLocations');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test for renting an item (mocking data)
  it('POST /rent/:userId/:item/:location should rent an item', async () => {
    const userId = 'mockUserId';
    const item = 'mockItem';
    const location = 'mockLocation';

    const res = await request(app).post(`/rent/${userId}/${item}/${location}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Location added successfully');
  });

  // Test for canceling rental (mocking data)
  it('POST /cancel-rent/:userId/:item should cancel the rental', async () => {
    const userId = 'mockUserId';
    const item = 'mockItem';

    const res = await request(app).post(`/cancel-rent/${userId}/${item}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Rental cancelled and fields removed successfully');
  });

});
