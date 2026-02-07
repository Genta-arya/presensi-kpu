import React from 'react'
import { FaChevronLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const Navigations = ({title}) => {
    const navigate = useNavigate()
  return (
    <div className='flex fixed z-20 w-full items-center justify-start gap-2  p-4 bg-red-600 text-white'>
        <FaChevronLeft onClick={() => navigate("/")} />
        <span className="ml-2 text-lg font-bold ">{title}</span>
    </div>
  )
}

export default Navigations