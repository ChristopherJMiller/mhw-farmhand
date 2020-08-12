import React, { useRef, useState } from 'react'
import { InputGroup, FormControl, Spinner, Card, Row, Col, ListGroup, Button } from 'react-bootstrap';
import debounce from 'lodash/debounce'
import useQuery from './lib/useQuery';
import { RarityBuildType, CharmType, CharmItem } from './lib/BuildTypes';
import { Rank, getRank } from './lib/Rank';
import { useHistory } from 'react-router-dom';

interface BuildListElementProps {
  item: RarityBuildType
  onClick: () => void
  isSelected: boolean
}

interface SelectedMap {
  [itemID: number]: Tagged<RarityBuildType>
}

const getQueryPrefix = (type: string): string => {
  return type.charAt(0)
}

const getBackgroundColor = (selected: boolean, rank: Rank): string => {
  const selectedMod = (text: string) => selected ? `${text}-active` : text
  switch (rank) {
    case Rank.Low: return selectedMod('low-rank-bg')
    case Rank.High: return selectedMod('high-rank-bg')
    case Rank.Master: return selectedMod('master-rank-bg')
  }
}

const BuildListElement = ({item, isSelected, onClick}: BuildListElementProps) => {
  return (
    <Card className={`my-3 ${getBackgroundColor(isSelected, getRank(item.rarity))}`} onClick={onClick}>
      <Card.Body>
        <Row>
          <Col className={'text-left text-capitalize'}>
            {item.name}
          </Col>
          <Col className={'text-right text-capitalize'}>
            {item.type} | {item.rarity}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

const charmListToCharmItems = (list: CharmType[]): CharmItem[] => list.map((item) => ({
  name: item.name,
  id: item.id,
  type: item.type,
  rarity: Math.max(...item.ranks.map((rank) => rank.rarity))
}))
type Tagged<T> = [T, string]

const listMapper = (list: Tagged<RarityBuildType>[], selectedList: SelectedMap, onClick: (item: Tagged<RarityBuildType>) => void) => 
  list.map((item) => <BuildListElement isSelected={selectedList[item[0].id] !== undefined} item={item[0]} onClick={() => onClick(item)} />)
const tag = (item: any, tag: string): Tagged<typeof item> => [item, tag]

const BuildingSearch = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, query, lookup, result] = useQuery()
  const [selectedItems, setSelectedItems] = useState<SelectedMap>()
  const history = useHistory()

  const debouncedLookup = useRef(debounce(lookup, 500)).current
  const Loading = loading ? <Spinner animation="border" /> : null

  const weapons = result?.weapon || []
  const armor = result?.armor || []
  const charms = result?.charm ? charmListToCharmItems(result?.charm) : []

  const aggList = [
    ...weapons.map((item) => tag(item, 'weapons')),
    ...armor.map((item) => tag(item, 'armor')),
    ...charms.map((item) => tag(item, 'charms')),
  ]

  aggList.sort((a: Tagged<RarityBuildType>, b: Tagged<RarityBuildType>) => a[0].rarity - b[0].rarity)

  const toggleItemSelect = (item: Tagged<RarityBuildType>) => {
    const selectedCopy: SelectedMap = {...selectedItems}
    const itemID = item[0].id
    if (selectedCopy[itemID]) {
      delete selectedCopy[itemID]
      setSelectedItems(selectedCopy)
      return
    }

    selectedCopy[itemID] = item
    setSelectedItems(selectedCopy)
    return
  }

  const ensuredSelected = selectedItems || {}
  const buildQueryURL = (): string => {
    const queries = Object.keys(ensuredSelected).map((key) => {
      const id = Number(key)
      const taggedPair = ensuredSelected[id]
      return `${getQueryPrefix(taggedPair[1])}${id}`
    })

    return `/mhw-farmhand/${queries.join('+')}`
  }

  const selectedKeys = Object.keys(ensuredSelected)
  const SelectedList = selectedKeys.map((key) => {
    const id = Number(key)
    const taggedPair = ensuredSelected[id]
    return (
      <ListGroup.Item>{taggedPair[0].name}</ListGroup.Item>
    )
  })

  const SelectedCard = selectedKeys.length === 0 ? null :
    <Card className="sticky-top mt-4">
      <Card.Header>Build List</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {SelectedList}
        </ListGroup>
      </Card.Body>
      <Card.Footer>
        <Button block onClick={() => history.push(buildQueryURL())}>Build</Button>
      </Card.Footer>
    </Card>

  const BuildList = listMapper(aggList, selectedItems || {}, (item) => toggleItemSelect(item))

  return (
    <div className="row w-100">
      <div className="col-md-3 col-sm-12">
        {SelectedCard}
      </div>
      <div className="col-md-6 col-sm-12 mt-4">
        <h1>What are you trying to build?</h1>
        <InputGroup size="lg">
          <FormControl 
            aria-label="Large"
            aria-describedby="inputGroup-sizing-sm" 
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => debouncedLookup(event.target.value)}
          />
        </InputGroup>
        {Loading}
        {BuildList}
      </div>
    </div>
  )
}

export default BuildingSearch