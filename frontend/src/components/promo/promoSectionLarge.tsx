interface Props {
  title: string;
  full_description: string;
  pageHeaderBgImg: string;
  pageHeaderMinVh: string;
  pageHeaderRadius: string;
}

export default function TestimonialsFade({
  title,
  full_description,
  pageHeaderBgImg,
  pageHeaderMinVh,
  pageHeaderRadius,
}: Props) {

  async function requestAccount() {
    console.log("Requesting access...")
  }

  const styles = {
    pageHeader: {
      backgroundImage: 'url(' + pageHeaderBgImg + ')',
      minHeight: pageHeaderMinVh,
      borderRadius: pageHeaderRadius
    },
  } as const;

  return (
    <>
      <section>
        <div className="page-header py-5 py-md-0" style={styles.pageHeader}>
          <span className="mask bg-gradient-dark opacity-4"></span>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-sm-9 text-center mx-auto">
                <h1 className="text-white mb-4">{title}</h1>
                <p className="lead text-white mb-sm-6 mb-4">{full_description}</p>
                <button className="btn btn-primary btn-lg" onClick={requestAccount}>Connect</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

