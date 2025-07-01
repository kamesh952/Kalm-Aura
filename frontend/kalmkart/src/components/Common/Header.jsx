  import React from 'react'
import { jsx } from 'react/jsx-runtime'
import Topbar from '../Layout/Topbar'
import Navbar from './Navbar'
  
  const Header = () => {
    return (
      <header className="border-b border-gray-200">
        {/* Topbar*/}
        < Topbar />
        < Navbar />
       </header>
    )
  }
  
  export default Header