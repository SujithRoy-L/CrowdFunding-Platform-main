import React from "react";
//import { Container, Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid className="py-4">
        <Row>
          {/* Company Info - Left Side */}
          <Col md={4} className="mb-3">
            <a
              href="/admin/login"
              className="text-white text-decoration-none"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h5 className="startup-fund-title" style={{ cursor: "pointer" }}>
                StartupFund
              </h5>
            </a>
            <p className="mb-0">Where investors connect with startups</p>
            <p className="mb-0">Made with ❤️ for Startups</p>
          </Col>

          {/* Quick Links - Middle */}
          <Col md={4} className="mb-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/about" className="text-decoration-none text-white">
                  About
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-decoration-none text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-decoration-none text-white">
                  Privacy
                </Link>
              </li>
            </ul>
            {/* <div>
              < button Hello /> 
            </div> */}
          </Col>

          {/* Contact Info - Right Side */}
          <Col md={4} className="mb-3">
            <h5>Contact Us</h5>
            <p className="mb-1">Email: info@startupfund.com</p>
            <p className="mb-1">Phone: +91 9030280208</p>
            <p className="mb-0">Address: Sega Towers</p>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="mt-3 border-top pt-3">
          <Col className="text-center">
            <small>© 2024 StartupFund. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
