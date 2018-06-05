import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Icon from '@material-ui/core/Icon'
import Modal from '@material-ui/core/Modal';
import axios from 'axios'
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

function getDateDiff(dateTimeStamp) {
  let minute = 1000 * 60;
  let hour = minute * 60;
  let day = hour * 24;
  let halfamonth = day * 15;
  let month = day * 30;
  let now = new Date().getTime();
  let diffValue = now - new Date(dateTimeStamp).getTime();
  if (diffValue < 0) {
    diffValue = 0;
  }
  let monthC = diffValue / month;
  let weekC = diffValue / (7 * day);
  let dayC = diffValue / day;
  let hourC = diffValue / hour;
  let minC = diffValue / minute;
  let result = "";
  if (monthC >= 1) {
    result = parseInt(monthC) + " 个月前";
  } else if (weekC >= 1) {
    result = parseInt(weekC) + " 周前";
  } else if (dayC >= 1) {
    result = parseInt(dayC) + " 天前";
  } else if (hourC >= 1) {
    result = parseInt(hourC) + " 小时前";
  } else if (minC >= 1) {
    result = parseInt(minC) + " 分钟前";
  } else result = "刚刚发表";
  return result;
}

const styles = {
  root: {
    flexGrow: 1,
  },
};

function SimpleAppBar(props) {
  return (
    <div>
      <AppBar position="fixed" color="default" style={{ boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)' }}>
        <Toolbar style={{ width: 800, margin: 'auto' }}>
          <Typography variant="title" color="inherit">
            PKU-HOLE-ARCHIVE
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

SimpleAppBar = withStyles(styles)(SimpleAppBar)

class CardList extends Component {
  render () {
    return (
      <div style={{ paddingTop: 80, width: 600, margin: 'auto' }}>
        {
          this.props.cards.map(v =>
            <Card style={{ marginBottom: 14 }} key={ v.pid }>
              <CardContent style={{ paddingBottom: 0 }}>
                <Typography color="textSecondary">
                  { `#${v.pid} · ${getDateDiff(v.timestamp * 1000)}` }
                </Typography>
                <Typography variant="headline" component="h2">
                </Typography>
                <Typography>
                  { v.text }
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={ () => this.props.handleOpen(v.pid, v) }><Icon style={{ fontSize: 18 }}>favorite</Icon><div>&nbsp;{ v.likenum }</div></Button>
                <Button size="small" onClick={ () => this.props.handleOpen(v.pid, v) }><Icon style={{ fontSize: 18 }}>comment</Icon><div>&nbsp;{ v.reply }</div></Button>
              </CardActions>
            </Card>
          )
        }
      </div>
    )
  }
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fromPid: 0,
      cards: [],
      open: false,
      cardDetail: {
        abstract: null,
        replys: []
      },
      gettingNextPage: false
    }
    this.handleClose  = this.handleClose.bind(this)
    this.handleOpen   = this.handleOpen.bind(this)
    this.nextPage     = this.nextPage.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  handleOpen = (pid, abstract) => {
    this.setState({
      open: true,
      cardDetail: {
        abstract: abstract,
        replys: []
      }
    });
    axios
      .get('/d', {
        params: {
          pid
        }
      })
      .then(res => {
        this.setState({
          cardDetail: {
            abstract: abstract,
            replys: JSON.parse(res.data.data.text).data
          }
        })
      })
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  nextPage () {
    if (this.state.gettingNextPage) {
      return
    } else {
      this.setState({
        gettingNextPage: true
      })
      axios
      .get('/q', {
        params: {
          fromPid: this.state.fromPid
        }
      })
      .then(res => {
        this.setState((prevState) => {
          console.log(res.data.data[res.data.data.length - 1].pid)
          return {
            cards: prevState.cards.concat(res.data.data),
            fromPid: res.data.data[res.data.data.length - 1].pid
          }
        })
        this.setState({
          gettingNextPage: false
        })
      })
      .catch(err => {
        alert('出错了，暂时懒得写错误处理')
        this.setState({
          gettingNextPage: false
        })
      })
    }
  }

  componentDidMount () {
    this.nextPage()
    window.addEventListener('scroll', (e) => {
      this.handleScroll()
    })
  }

  handleScroll (event) {
    if (window.scrollY + window.innerHeight === document.scrollingElement.scrollHeight && !this.state.gettingNextPage) {
      this.nextPage()
    }
  }

  render() {
    return (
      <div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
          onClose={this.handleClose}
          style={{
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <div style={{ marginTop: 64, marginBottom: 64 }}>
            <Card style={{ width: 600 }}>
              <CardContent>
                { this.state.cardDetail.abstract ?
                  <div>
                    <Typography color="textSecondary">
                      { `#${this.state.cardDetail.abstract.pid} · ${getDateDiff(this.state.cardDetail.abstract.timestamp * 1000)}` }
                    </Typography>
                    <Typography variant="headline" component="h2">
                    </Typography>
                    <Typography>
                      { this.state.cardDetail.abstract.text }
                    </Typography>
                  </div> :
                  null
                }
              </CardContent>
            </Card>
            {
              this.state.cardDetail.replys.length ?
              <Card style={{ marginTop: 14, width: 600 }}>
                {
                  this.state.cardDetail.replys ?
                  this.state.cardDetail.replys.map((v, i) => {
                    return (
                      <div>
                        {
                          i === 0 ?
                          null:
                          <Divider/>
                        }
                        <CardContent>
                          <Typography color="textSecondary">
                            { `#${v.cid} · ${getDateDiff(v.timestamp * 1000)}` }
                          </Typography>
                          <Typography variant="headline" component="h2">
                          </Typography>
                          <Typography>
                            { v.text }
                          </Typography>
                        </CardContent>
                      </div>
                    )
                  })
                  :
                  null
                }
              </Card> :
              null
            }
          </div>
        </Modal>
        <SimpleAppBar/>
        <CardList cards={ this.state.cards } handleOpen={ this.handleOpen }/>
        <div style={{ height: 60, margin: 'auto', width: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {
              this.state.gettingNextPage ?
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={ 28 } /><span style={{ marginLeft: 7, fontSize: 14 }}>正在加载信息</span>
              </div> :
              null
            }
        </div>
      </div>
    );
  }
}

export default App;
