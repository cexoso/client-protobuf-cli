import { ServerHttp2Stream } from 'http2';

export function response200(stream: ServerHttp2Stream, contentType: string) {
  stream.respond(
    {
      ':status': 200,
      'content-type': contentType,
    },
    { waitForTrailers: true }
  );
}

export function response404(stream: ServerHttp2Stream) {
  stream.respond({
    ':status': 404,
  });
  stream.end();
}
