from vetyCutter import cut_listen_file
from argparse import ArgumentParser

def parse_args():
    parser = ArgumentParser(description="Vety Cli v1.0.0\n(Core v1.3.1)")
    args = parser.parse_args()
    return args

if __name__ == "__main__":
    parse_args()