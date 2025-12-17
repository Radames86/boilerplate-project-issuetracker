const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);

let testId;

suite('Functional Tests', function() {

  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Bug in code',
        issue_text: 'Null pointer exception',
        created_by: 'Master',
        assigned_to: 'Zaylee',
        status_text: 'In QA'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Bug in code');
        assert.equal(res.body.issue_text, 'Null pointer exception');
        assert.equal(res.body.created_by, 'Master');
        assert.equal(res.body.assigned_to, 'Zaylee');
        assert.equal(res.body.status_text, 'In QA');
        assert.exists(res.body._id);
        testId = res.body._id;
        done();
      });
  });

  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Required only',
        issue_text: 'Just testing',
        created_by: 'Master'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        done();
      });
  });

  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Missing text'
      })
      .end(function(err, res){
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res){
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/test?created_by=Master')
      .end(function(err, res){
        assert.isArray(res.body);
        res.body.forEach(i => assert.equal(i.created_by, 'Master'));
        done();
      });
  });

  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/test?open=true&created_by=Master')
      .end(function(err, res){
        assert.isArray(res.body);
        done();
      });
  });

  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_text: 'Updated text' })
      .end(function(err, res){
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_title: 'Updated title', open: false })
      .end(function(err, res){
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ issue_text: 'Missing id' })
      .end(function(err, res){
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res){
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: 'fakeid123', issue_text: 'bad id' })
      .end(function(err, res){
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res){
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  test('Delete an issue with invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalidid' })
      .end(function(err, res){
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res){
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});
