import React, { Component } from 'react';
import { FaFilter, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueButtonList,
  IssueButton,
  IssueList,
  IssuePageList,
  PageButton,
} from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'open',
    page: 1,
    nextPage: false,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { state, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      nextPage: issues.data.length === 5,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { state, page, repository } = this.state;

    if (prevState.state !== state || prevState.page !== page) {
      const repoName = repository.full_name;

      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
          page,
        },
      });

      console.log(issues.data.length);

      this.setState({
        issues: issues.data,
        loading: false,
        nextPage: issues.data.length === 5,
      });
    }
  }

  handleIssue(state) {
    this.setState({ state });
  }

  handlePage(page) {
    this.setState({ page });
  }

  render() {
    const { repository, issues, loading, state, page, nextPage } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <h1>
          <FaFilter />
          Problemas
        </h1>
        <IssueButtonList>
          <IssueButton
            onClick={() => this.handleIssue('open')}
            selected={state === 'open' ? 1 : 0}
          >
            Abertos
          </IssueButton>
          <IssueButton
            onClick={() => this.handleIssue('closed')}
            selected={state === 'closed' ? 1 : 0}
          >
            Fechados
          </IssueButton>
          <IssueButton
            onClick={() => this.handleIssue('all')}
            selected={state === 'all' ? 1 : 0}
          >
            Todos
          </IssueButton>
        </IssueButtonList>

        <IssuePageList>
          <PageButton
            onClick={() => this.handlePage(page - 1)}
            disabled={page === 1 ? 1 : 0}
          >
            <FaArrowLeft />
          </PageButton>
          <PageButton
            onClick={() => this.handlePage(page + 1)}
            disabled={nextPage ? 0 : 1}
          >
            <FaArrowRight />
          </PageButton>
        </IssuePageList>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
