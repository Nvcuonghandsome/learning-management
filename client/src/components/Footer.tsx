import Link from 'next/link';
import React from 'react';

type Props = {};

const Footer = (props: Props) => {
  return (
    <div className="footer">
      <p className="">&copy; 2025 CuongNguyen. All Rights Reserved.</p>
      <div className="footer__links">
        {['About', 'Privacy Policy', 'Licensing', 'Contact'].map((item) => (
          <Link
            key={item}
            href={`${item.toLowerCase().replace(' ', '-')}`}
            className="footer__link"
            scroll={false}
          />
        ))}
      </div>
    </div>
  );
};

export default Footer;
