function Home() {
  return (
    <div>
      <h1 className="mt-5 align-middle text-center text-danger fs-1 fw-bold font-monospace">
        Welcome to Quiz Maker!
      </h1>
      <br />
      <br />
      <br />
      <div className="container text-center text-light">
        <div className="row">
          <div className="col fs-4">
            <p>
              If you are already registered <br /> click on login button
            </p>
            <button type="button" className="btn btn-primary text-light">
              Login
            </button>
          </div>
          <div className="col fs-4">
            <p>
              If you want to register <br /> click on Register button
            </p>
            <button type="button" className="btn btn-primary text-light">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
