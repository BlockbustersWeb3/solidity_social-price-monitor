import React from 'react'

export default function InteractiveButton() {
  function example(){
    console.log("You have clicked it")
  }
  return (
    <button onClick={example}>Click me</button>
  )
}
