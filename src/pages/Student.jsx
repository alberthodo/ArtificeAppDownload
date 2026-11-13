import { Link } from '../lib/router.jsx';

export default function Student() {
  return (
    <div className="narrow">
      <h1>Artifice for students</h1>
      <p className="sub">Free while you’re a student: everything in Pro, for study and personal projects.</p>
      <h2 className="h">How it works</h2>
      <ol className="steps">
        <li><Link to="/download">Download Artifice</Link> and sign in.</li>
        <li>Go to <b>Account › Plan › Student?</b> and type your school email address.</li>
        <li>Type the 6-digit code we send there. That’s it.</li>
      </ol>
      <p>We delete your school address once it’s checked, and keep only its domain (for example <i>stanford.edu</i>). We check again once a year.</p>
      <h2 className="h">School not recognised?</h2>
      <p>Email <a href="mailto:support@tryartifice.com">support@tryartifice.com</a> from your school address and we’ll add your school.</p>
      <p className="note">Using Artifice for paid work, or for a company, needs <Link to="/pricing">Pro</Link>.</p>
    </div>
  );
}
