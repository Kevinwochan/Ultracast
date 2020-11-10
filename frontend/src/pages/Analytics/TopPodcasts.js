import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import CircularProgress from "@material-ui/core/CircularProgress";
import Title from "./Title";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  podcastCover: {
    height: 100,
    width: 100,
  },
}));

export default function TopPodcasts({ data }) {
  const classes = useStyles();

  if (data === null) {
    return <CircularProgress />;
  }

  let podcasts = data.publishedPodcasts.edges
    .map((podcast) => ({
      id: podcast.node.id,
      title: podcast.node.name,
      image: podcast.node.coverUrl
        ? podcast.node.coverUrl
        : "/branding/square.svg",
      date: new Date(podcast.node.publishDate),
      views: podcast.node.episodes.edges.reduce(
        (a, b) => a + b.node.views.totalCount,
        0
      ),
    }))
    .sort((a, b) => b.views - a.views);

  return (
    <>
      <Title>Your top podcasts</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Podcast Cover</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Views</TableCell>
            <TableCell>Publish Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {podcasts.map((podcast) => (
            <TableRow key={podcast.id}>
              <TableCell>
                <Link href={`/creators/podcast/${podcast.id}`}>
                  <img
                    src={podcast.image}
                    alt={`${podcast.title} cover`}
                    className={classes.podcastCover}
                  />
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/creators/podcast/${podcast.id}`}>
                  {podcast.title}
                </Link>
              </TableCell>
              <TableCell>{podcast.views}</TableCell>
              <TableCell>{podcast.date.toDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
