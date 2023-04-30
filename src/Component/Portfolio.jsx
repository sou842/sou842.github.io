import './PortfolioStyle.css';
import './PortfolioMedia.css'
import Typed from 'react-typed';
import myPic from '../pic/myPic.jpg';
import html from '../pic/html-5.png';
import css from '../pic/css-3.png';
import react from '../pic/react.png';
import js from '../pic/js.png';
import chakra from '../pic/chakra_ui.png';
import mongodb from '../pic/mongodb.png';
import ZARA from '../pic/ZARA.jpg'
import EDDIE from '../pic/EDDIE.jpg'
import EBAY from '../pic/EBAY.jpg'
import DARROW from '../pic/DARROW.gif'
import gitHub from '../pic/gitHub.jpg'
import { useState } from 'react';

function Portfolio(){
const[btn,setBtn] = useState(false)

const handleBtn = () =>{
setBtn(!btn)
}


return(
<div className='container'>
{/* fixed */}
<div className='fixed'>
  <a href="#home">
    <img src="https://cdn-icons-png.flaticon.com/512/992/992703.png" alt="arrow" />
  </a>
  <a href="#">
  <img src="https://d33wubrfki0l68.cloudfront.net/d8e6e1e636531e28274a1b8b6d947b817f6145bd/d42d3/assets/svg/linkedin-dark.svg" alt="linkwdin" />
  </a>
  <a href="#">
  <img src="https://d33wubrfki0l68.cloudfront.net/38469cf88d038b6ba3322c9fcb93a8f7167df4b9/cb0b9/assets/svg/github-dark.svg" alt="github" />
  </a>
</div>
{/* sidleBar */}
<div style={{height:btn?'auto':'0'}} className='side'>
  <div><a href="#home">HOME</a></div>
  <div><a href="#about">ABOUT</a></div>
  <div><a href="#skills">SKILL</a></div>
  <div><a href="#projects">PROJECT</a></div>
  <div><a href="#Statics">STATICS</a></div>
  <div><a href="#contact">CONTEACTS</a></div>
</div>
{/* navbar */}
<nav id='nav-menu'>
    <h1 onClick={handleBtn}>{btn?'X':'|||'}</h1>
    <div>
    <h1><b>S</b>ourav.</h1>
    </div>
    <div>
    <a class="nav-link home" href="#home" style={{color:'orange'}}><p>HOME</p></a>
    <a className='nav-link about' href="#about"><p>ABOUT</p></a>
    <a class="nav-link skills" href="#skills"><p>SKILL</p></a>
    <a className='nav-link projects' href="#projects"><p>PROJECT</p></a>
    <a href="#Statics"><p>STATICS</p></a>
    <a className='nav-link contact' href="#contact"><p>CONTEACTS</p></a>
    <button className='nav-link resume'>RESUME</button>
    </div>
</nav>
<div id='home' className='homes'>
<div className='intro'>
    <div>
    <h1 id='user-detail-name'><b style={{color:"#ffb514d2"}}>Hi</b>, I'm Sourav Samanta</h1>
    <p id="user-detail-intro">
    <Typed strings={['Full Stack Web Developer','Here you can find everything about me']} backSpeed={50} backDelay={500} typeSpeed={50} loop></Typed>
    </p>
    <a href="#projects">
    <button>PROJECT</button>
    </a>
    </div>
</div>
</div>
{/* arrow */}
<div className='arrow'>
  <img src={DARROW} alt="" />
</div>
{/* ABOUT */}
<div className='about_main about section' id='about'>
<div className='About'>
<div className='work'>
    <img src={myPic} className={'home-img'} alt="" />
    <div className='layer'>
        <h3>Social Media App</h3>
        <p>The App tab-contents youyo the talented people around the world. 
            Download it from play store.
        </p>
        <a href="#">
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-facebook" viewBox="0 0 16 16">
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
        </svg>
        </a>
    </div>
</div>
<div>
<h1 id='user-detail-intro'><b style={{color:'#facf0f'}}>A</b>BOUT ME</h1>
<p>Solution-driven web developer adept at contributing to
    highly collaborative work environment and finding solutions.
    Good knowledge of the best practices for web design, user
    experience, and speed.
</p>
<div className='about_details'>

<div>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
</svg>
<p>Kolkata, WestBengal</p>
</div>
<div>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-fill" viewBox="0 0 16 16">
  <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
</svg>
<p id="contact-email">SouravSamanta@gmail.com</p>
</div>
<div>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
</svg>
<p  id="contact-phone">+91 9903149299</p>
</div>
<div>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg>
<p id="contact-github"><a href="#">GitHub</a></p>
</div>
<div>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16">
  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
</svg>
<p id="contact-linkedin"><a href="#">LinkIn</a></p>
</div>

</div>
</div>
</div>
</div>
{/* Skills */}
<div className='skill' id='skills'>
  <h1>MY SKILLS
    <div></div>
  </h1>
<div className='skills_list'>
{/* 2 */}
<div>
  <div class="skills-card">
    <img class="skills-card-img" src={html} alt='html'/>
    <p class="skills-card-name">HTML</p>
  </div>
  <div class="skills-card">
    <img class="skills-card-img" src={js} alt="js" />
    <p>JS</p>
  </div>
  <div class="skills-card">
    <img class="skills-card-img" src={css} alt="css" />
    <p class="skills-card-name">CSS</p>
  </div>
  <div class="skills-card">
    <img class="skills-card-img" src={react} alt="react" />
    <p class="skills-card-name">REACT</p>
  </div>
  <div>
    <p>Continue
      Add →</p>
  </div>
</div>
{/* 3 */}
<div>
<div class="skills-card">
    <img class="skills-card-img" src={'https://img.icons8.com/color/512/nodejs.png'} alt="node" />
    <p class="skills-card-name">nodeJS</p>
  </div>
  <div class="skills-card">
    <img class="skills-card-img" src="https://redux.js.org/img/redux.svg" alt="redux" />
    <p class="skills-card-name">REDUX</p>
  </div>
  <div class="skills-card">
    <img class="skills-card-img" src={mongodb} alt="mongodb" />
    <p class="skills-card-name">Mongo</p>
  </div>
  <div class="skills-card">
    <img class="skills-card-img" src={chakra} alt="chakra" />
    <p class="skills-card-name">Chakra</p>
  </div>
  <div class="skills-card">
    <img class="skills-card-img" src={'https://cdn-icons-png.flaticon.com/512/984/984671.png'} alt="DSA" />
    <p class="skills-card-name">DSA</p>
  </div>
</div>
</div>
</div>
{/* Project */}

<div id='projects' className="project">
    <h1>PROJECT
      <div></div>
    </h1>

  {/* 1 */}
  <div className='project_item project-card'>
  <div className='work project_item_pic'>
    <img src={EBAY} alt="" />
    <div className='project_layer'>
        <a class="project-github-link" href="#"><p>GitHub</p></a>
        <a class="project-deployed-link" href="https://electro-yzzdz9yh7-sou842.vercel.app/" target='_blank'><p>Live</p></a>
    </div>
</div>
<div className='project_item_info'>
<p class="project-description">Solution-driven web developer adept at contributing to
    highly collaborative work environment and finding solutions.
    Good knowledge of the best practices for web design, user
    experience, and speed.
</p>
<div className='project_item_icon'>
  <div class="project-tech-stack">Tech-Stack :</div>
  <div>
  <img src={react} alt="html" />
  </div>
  <div>
  <img src={css} alt="css" />
  </div>
  <div>
    <img src={js} alt="" />
  </div>
</div>
</div>
  </div>
{/* 2 */}
<div className='project_item project-card'>
<div className='project_item_info'>
<p class="project-description">Solution-driven web developer adept at contributing to
    highly collaborative work environment and finding solutions.
    Good knowledge of the best practices for web design, user
    experience, and speed.
</p>
<div className='project_item_icon'>
  <div class="project-tech-stack">Tech-Stack :</div>
  <div>
  <img src={html} alt="html" />
  </div>
  <div>
  <img src={css} alt="css" />
  </div>
  <div>
    <img src={js} alt="" />
  </div>
</div>
</div>
  <div className='work project_item_pic'>
    <img src={ZARA} alt="" />
    <div className='project_layer'>
        <a class="project-github-link" href="#"><p>GitHub</p></a>
        <a class="project-deployed-link" href="https://zingy-concha-41e163.netlify.app/" target='_blank'><p>Live</p></a>
    </div>
</div>
  </div>
  {/* 3 */}
  <div className='project_item project-card'>
  <div className='work project_item_pic'>
    <img src={EDDIE} alt="" />
    <div className='project_layer'>
    <a class="project-github-link" href="#"><p>GitHub</p></a>
    <a class="project-deployed-link" href="https://resplendent-cucurucho-20b16a.netlify.app/" target='_blank'><p>Live</p></a>
    </div>
</div>
<div className='project_item_info'>
<p class="project-description">Solution-driven web developer adept at contributing to
    highly collaborative work environment and finding solutions.
    Good knowledge of the best practices for web design, user
    experience, and speed.
</p>
<div className='project_item_icon'>
  <div class="project-tech-stack">Tech-Stack :</div>
  <div>
  <img src={html} alt="html" />
  </div>
  <div>
  <img src={css} alt="css" />
  </div>
  <div>
    <img src={js} alt="" />
  </div>
</div>
</div>
  </div>
</div>
{/* STATICS */}

<div id='Statics' className="static">
  <h1>STATICS
    <div></div>
  </h1>
  <div className="static_item">
    <img src="https://camo.githubusercontent.com/e5cef30a321527f553377ec8f50c2d20700f2681c92d562d99820af0ca260954/68747470733a2f2f6769746875622d726561646d652d73747265616b2d73746174732e6865726f6b756170702e636f6d2f3f757365723d736f7538343226" alt="1" />
  </div>
  <div className='static_item'>
    <img src={gitHub} alt="4" />
  </div>
  <div className="static_item">
    <div>
    <img src="https://camo.githubusercontent.com/fc4d885d6134c30a2da0b0f910afffa079b887ec555b60d5e98196f2c5b96dab/68747470733a2f2f6769746875622d726561646d652d73746174732e76657263656c2e6170702f6170692f746f702d6c616e67733f757365726e616d653d736f753834322673686f775f69636f6e733d74727565266c6f63616c653d656e266c61796f75743d636f6d70616374" alt="3" />
    </div>
    <div>
    <img src="https://camo.githubusercontent.com/46d20df1ad5438b20eff2d9518f4d3b04e80834b15a2e03cb1bb6389fa319635/68747470733a2f2f6769746875622d726561646d652d73746174732e76657263656c2e6170702f6170693f757365726e616d653d736f753834322673686f775f69636f6e733d74727565266c6f63616c653d656e" alt="2" />
    </div>
  </div>
</div>
{/* CONTEACTS */}
<div className='conteact' id='contact'>
<div className='conteact_item'>
<div id='conteact_info'>
  <h1>CONTEACT <b style={{color:'#facf0f'}}>M</b>E</h1>
  <div>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-envelope-at-fill" viewBox="0 0 16 16">
  <path d="M2 2A2 2 0 0 0 .05 3.555L8 8.414l7.95-4.859A2 2 0 0 0 14 2H2Zm-2 9.8V4.698l5.803 3.546L0 11.801Zm6.761-2.97-6.57 4.026A2 2 0 0 0 2 14h6.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586l-1.239-.757ZM16 9.671V4.697l-5.803 3.546.338.208A4.482 4.482 0 0 1 12.5 8c1.414 0 2.675.652 3.5 1.671Z"/>
  <path d="M15.834 12.244c0 1.168-.577 2.025-1.587 2.025-.503 0-1.002-.228-1.12-.648h-.043c-.118.416-.543.643-1.015.643-.77 0-1.259-.542-1.259-1.434v-.529c0-.844.481-1.4 1.26-1.4.585 0 .87.333.953.63h.03v-.568h.905v2.19c0 .272.18.42.411.42.315 0 .639-.415.639-1.39v-.118c0-1.277-.95-2.326-2.484-2.326h-.04c-1.582 0-2.64 1.067-2.64 2.724v.157c0 1.867 1.237 2.654 2.57 2.654h.045c.507 0 .935-.07 1.18-.18v.731c-.219.1-.643.175-1.237.175h-.044C10.438 16 9 14.82 9 12.646v-.214C9 10.36 10.421 9 12.485 9h.035c2.12 0 3.314 1.43 3.314 3.034v.21Zm-4.04.21v.227c0 .586.227.8.581.8.31 0 .564-.17.564-.743v-.367c0-.516-.275-.708-.572-.708-.346 0-.573.245-.573.791Z"/>
  </svg>
<p>SouravSamanta@gmail.com</p>
  </div>
  <div>
  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-telephone" viewBox="0 0 16 16">
  <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
  </svg>
  <p>+91 9903149299</p>
  </div>
<button>RESUME</button>
</div>
<div>
<form name="submit-to-google-sheet">
  <input type="text" placeholder='Your Name'/> <br />
  <input type="email" placeholder='Your Email'/> <br />
  <textarea name="Message" rows="6" placeholder="Your Message"></textarea> <br />
  <button type="submit" id="ss">Submit</button>
</form>
</div>
</div>
</div>
</div>
)
}

export default Portfolio;
