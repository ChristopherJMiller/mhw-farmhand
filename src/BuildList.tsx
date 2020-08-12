import React from 'react'
import { useParams } from 'react-router-dom'
import { BuildType } from './lib/BuildTypes'
import useBuildBreakdown, { DetailedStep } from './lib/useBuildBreakdown'
import { Card, Row, Col, ListGroup } from 'react-bootstrap'

interface TypeLut {
  [key: string]: BuildType
}

const TYPE_LUT: TypeLut = {
  'w': BuildType.Weapon,
  'a': BuildType.Armor,
  'c': BuildType.Charm
}

interface BuildStepCardProps {
  stepNum: number
  step: DetailedStep
}

const BuildStepCard = ({stepNum, step}: BuildStepCardProps) => {
  return (
    <Card className='my-3'>
      <Card.Header>Step {stepNum}</Card.Header>
      <Card.Body>
        <Row>
          <Col className={'text-left text-capitalize'}>
            <h3>Gather</h3>
            <ListGroup variant="flush">
              {step.gather.map((item) => <ListGroup.Item>{item.quantity}x {item.itemName}</ListGroup.Item>)}
            </ListGroup>
          </Col>
          <Col className={'text-right'}>
            <h3>Build</h3>
            <ListGroup variant="flush">
              {step.build.map((item) => <ListGroup.Item>{item.name} | {item.rarity}</ListGroup.Item>)}
            </ListGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}



export const BuildList = () => {
  const { query } = useParams()
  const individQueries = query.split('+')
  const builds = individQueries.map((singleQuery: string): [BuildType, number] => [TYPE_LUT[singleQuery.charAt(0)], Number(singleQuery.substring(1))])

  const [loading, buildPlan] = useBuildBreakdown(builds)

  const stepCards = loading || !buildPlan ? null : buildPlan.map((step, index) => <BuildStepCard stepNum={index} step={step} />)

  return (
    <div className="container">
      {stepCards}
    </div>
  )
}