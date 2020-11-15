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
  episodeCover: {
    height: 100,
    width: 100,
  },
}));

export default function TopEpisodes({ data }) {
  const classes = useStyles();

  if (data === null) {
    return <CircularProgress />;
  }

  let episodes = [];
  data.publishedPodcasts.edges.forEach((podcast) => {
    const podcastFormatted = {
      id: podcast.node.id,
      title: podcast.node.name,
      image: podcast.node.coverUrl
        ? podcast.node.coverUrl
        : "/branding/square.svg",
    };

    podcast.node.episodes.edges.forEach((episode) => {
      episodes.push({
        id: episode.node.id,
        title: episode.node.name,
        podcast: podcastFormatted,
        date: new Date(episode.node.publishDate),
        views: episode.node.views.totalCount,
      });
    });
  });
  episodes.sort((a, b) => b.views - a.views);

  return (
    <>
      <Title>Your top episodes</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Episode</TableCell>
            <TableCell>Podcast</TableCell>
            <TableCell>Views</TableCell>
            <TableCell>Publish Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {episodes.map((episode) => (
            <TableRow key={episode.id}>
              <TableCell>
                <Link href={`/creators/podcast/${episode.podcast.id}`}>
                  {episode.title}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/creators/podcast/${episode.podcast.id}`}>
                  {episode.podcast.title}
                </Link>
              </TableCell>
              <TableCell>{episode.views}</TableCell>
              <TableCell>{episode.date.toDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
