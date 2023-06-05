const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../../server/app');

const request = supertest(app);

const OOID = mongoose.Types.ObjectId("64732790ac46f91f7c8c8e99");

describe('/api/users - register', () => {

  beforeAll(async () => {
    await mongoose.disconnect();
    const url = 'mongodb://127.0.0.1/test';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  /* register post */
  test('POST: /api/users - expect register success 200', async (done) => {
    await request
      .post('/api/users')
      .send({
        _id: OOID,
        username: 'neilonlyhim',
        password: 'njcpassword',
        firstname: 'Neil Jason',
        middlename: 'Illana',
        lastname: 'Canete',
        birthday: new Date('07/28/1996'),
        gender: 'Male',
        civilstatus: 'Single',
        address: 'Maon',
        aboutme: 'Secretary',
        photo: '/profile-photo/123.jpeg'
      })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(!!res.body.success).toStrictEqual(true)
        done();
      });
  })
  /* register post */
  test('POST: /api/users - expected error 403 with error attribute', async (done) => {
    await request
      .post('/api/users')
      .send({
        username: 'neilonlyhim',
        middlename: 'Illana',
        lastname: 'Canete',
        birthday: new Date('07/28/1996'),
        gender: 'Male',
        civilstatus: 'Single',
        address: 'Maon',
        aboutme: 'Secretary'
      })
      .then(res => {
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ error: { status: 403, statusCode: 403, message: 'Invalid Request!' }})
        done();
      });
  })
  
});


describe('/api/users - login', () => {

  beforeAll(async () => {
    await mongoose.disconnect();
    const url = 'mongodb://127.0.0.1/test';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  /* login post */
  test('POST: /api/users/login - expected status 200 with success attribute', async (done) => {
    await request
      .post('/api/users/login')
      .send({
        username: 'neilonlyhim',
        password: 'njcpassword'
      })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(!!res.body.success).toStrictEqual(true)
        expect(res.body.success.message).toStrictEqual('Successfully Logged In!')
        done();
      });
  })
  /* login post error request */
  test('POST: /api/users/login - expected status 403 with error attribute', async (done) => {
    await request
      .post('/api/users/login')
      .send({
        username: 'neilonlyhim'
      })
      .then(res => {
        expect(res.statusCode).toBe(403);
        expect(res.body).toStrictEqual({ error: { status: 403, statusCode: 403, message: 'Invalid Request!' }})
        done();
      });
  })
  /* login post invalid password */
  test('POST: /api/users/login - expected invalid password status 200 with error attribute', async (done) => {
    await request
      .post('/api/users/login')
      .send({
        username: 'neilonlyhim',
        password: 'invalidpassword'
      })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
          error: { status: 401, statusCode: 401, message: 'Invalid Username or Password!'}
        })
        done();
      });
  })
  /* login post no user exists */
  test('POST: /api/users/login - expected status 200 with error attribute', async (done) => {
    await request
      .post('/api/users/login')
      .send({
        username: 'invalidusername',
        password: 'invalidpassword'
      })
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toStrictEqual({
          error: {
            status: 404, statusCode: 404,
            message: 'No Username Exists!'
          }
        })
        done();
      });
  })
});

describe('/api/users - online status', () => {

  beforeAll(async () => {
    await mongoose.disconnect();
    const url = 'mongodb://127.0.0.1/test';
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  /* online status */
  test(`PUT: /api/users/${OOID.toString()}/updateonlinestatus - expected status 200`, async (done) => {
    await request
      .put(`/api/users/${OOID.toString()}/updateonlinestatus`)
      .then(res => {
        expect(res.statusCode).toBe(200);
        expect(!!res.body.success).toStrictEqual(true)
        done();
      });
  })
  /* online status failed */
  test('PUT: /api/users/646b396c79560405b7c43892/updateonlinestatus - expected status 500', async (done) => {
    await request
      .put('/api/users/646b396c79560405b7c43892/updateonlinestatus')
      .then(res => {
        expect(res.statusCode).toBe(404);
        expect(res.body).toStrictEqual({ error: { status: 404, statusCode: 404, message: 'Invalid Request' }})
        done();
      });
  })
  
});

// describe('/api/users - delete', () => {

//   beforeAll(async () => {
//     await mongoose.disconnect();
//     const url = 'mongodb://127.0.0.1/test';
//     await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//   });

//   afterAll(async () => {
//     await mongoose.connection.close();
//   });

//   /* delete account failed status 403 */
//   test(`DELETE: /api/users/${OOID.toString()} - expected status 403 invalid password`, async (done) => {
//     await request
//       .delete(`DELETE: /api/users/${OOID.toString()}`)
//       .send({ password: 'invalidpassword' })
//       .then(res => {
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toStrictEqual('Invalid Request!')
//         done();
//       });
//   })
//   /* delete account failed status 403 */
//   test(`DELETE: /api/users/${OOID.toString()} - expected status 403 no account found`, async (done) => {
//     await request
//       .delete(`DELETE: /api/users/64731cc80b925f132c505c4f`)
//       .send({ password: 'njcpassword' })
//       .then(res => {
//         expect(res.statusCode).toBe(403);
//         expect(res.body).toStrictEqual('Invalid Request!')
//         done();
//       });
//   })
//   /* delete account success status 200 */
//   test(`DELETE: /api/users/${OOID.toString()} - expected status 403`, async (done) => {
//     await request
//       .delete(`DELETE: /api/users/${OOID.toString()}`)
//       .send({ password: 'njcpassword' })
//       .then(res => {
//         expect(res.statusCode).toBe(403);
//         expect(!!res.body.success).toStrictEqual(true)
//         expect(res.body.success.message).toStrictEqual('Account Delete Successfully')
//         expect(res.body.success.details.userid).toStrictEqual(OOID.toString())
//         done();
//       });
//   })
// });