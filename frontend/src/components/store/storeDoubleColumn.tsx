export default function StoreNavigationDoubleColumn() {
  return (
    <>
    <div className="row mt-5">
      <div className="col-6 col-lg-6 mb-4 mb-lg-0">
        <h6 className="w-100 pb-3 border-bottom">Social Price Monitoring</h6>
        <div className="d-flex pt-2">
          <ul className="nav flex-column ms-n3">
            <li className="nav-item">
              <a className="nav-link text-body" href="#" target="_blank">
                How it works
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-body" href="#" target="_blank">
                Team
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="col-6 col-lg-6">
        <h6 className="w-100 pb-3 border-bottom">About Blockbuster</h6>
        <ul className="nav flex-column ms-n3 pt-2">
          <li className="nav-item">
            <a className="nav-link text-body" href="#" target="_blank">
              Facebook
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-body" href="#" target="_blank">
              Instagram
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link text-body" href="#" target="_blank">
              Discord
            </a>
          </li>
        </ul>
      </div>
    </div>
    </>
  );
};
