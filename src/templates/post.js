import React from 'react';
import { graphql, Link } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';

const StyledPostContainer = styled.main`
  max-width: 1000px;
`;
const StyledPostHeader = styled.header`
  margin-bottom: 50px;
  .tag {
    margin-right: 10px;
  }
`;
const StyledPostContent = styled.div`
  margin-bottom: 100px;
  
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 2em 0 1em;
    color: var(--lightest-slate);
  }

  h2 {
    font-size: var(--fz-xxl);
    border-bottom: 1px solid var(--lightest-navy);
    padding-bottom: 10px;
  }

  h3 {
    font-size: var(--fz-xl);
    color: var(--green);
  }

  p {
    margin: 1em 0;
    line-height: 1.7;
    color: var(--light-slate);
    font-size: var(--fz-lg);
  }

  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }

  code {
    background-color: var(--lightest-navy);
    color: var(--green);
    border-radius: var(--border-radius);
    font-size: var(--fz-sm);
    padding: 0.2em 0.4em;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }

  ul, ol {
    margin: 1em 0;
    padding-left: 2em;
    color: var(--light-slate);
    line-height: 1.7;

    li {
      margin-bottom: 0.5em;
    }
  }

  strong {
    color: var(--lightest-slate);
    font-weight: 600;
  }

  em {
    color: var(--slate);
  }

  img {
    border-radius: var(--border-radius);
    margin: 2em 0;
    box-shadow: 0 10px 30px -15px var(--navy-shadow);
  }

  .highlight-box {
    background-color: var(--light-navy);
    border-left: 3px solid var(--green);
    padding: 1.5em;
    margin: 2em 0;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;

    p {
      margin: 0;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    font-size: var(--fz-md);
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  th, td {
    padding: 12px 16px;
    text-align: left;
    border: 1px solid var(--lightest-navy);
  }

  th {
    background-color: var(--light-navy);
    color: var(--lightest-slate);
    font-weight: 600;
    text-align: left;
  }

  td {
    color: var(--light-slate);
  }

  tr:nth-child(even) {
    background-color: rgba(17, 34, 64, 0.3);
  }

  tr:hover {
    background-color: var(--light-navy);
  }
`;

const PostTemplate = ({ data, location }) => {
  const { frontmatter, html } = data.markdownRemark;
  const { title, date, tags } = frontmatter;

  return (
    <Layout location={location}>
      <Helmet title={title} />

      <StyledPostContainer>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <Link to="/blog">Back to Blog</Link>
        </span>

        <StyledPostHeader>
          <h1 className="medium-heading">{title}</h1>
          <p className="subtitle">
            <time>
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>&nbsp;&mdash;&nbsp;</span>
            {tags &&
              tags.length > 0 &&
              tags.map((tag, i) => (
                <Link key={i} to={`/blog/tags/${kebabCase(tag)}/`} className="tag">
                  #{tag}
                </Link>
              ))}
          </p>
        </StyledPostHeader>

        <StyledPostContent dangerouslySetInnerHTML={{ __html: html }} />
      </StyledPostContainer>
    </Layout>
  );
};

export default PostTemplate;

PostTemplate.propTypes = {
  data: PropTypes.object,
  location: PropTypes.object,
};

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { slug: { eq: $path } }) {
      html
      frontmatter {
        title
        description
        date
        slug
        tags
      }
    }
  }
`;
